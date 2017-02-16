'use strict';

const path = require('path');
const glob = require('glob');
const {inspect} = require('util');
const _ = require('lodash');
const Promise = require('bluebird');
const argv = process.argv.slice(2);
const Table = require('cli-table');

const rootDir = process.cwd();
const modelsDir = argv.length
    ? path.resolve(argv[0])
    : path.resolve(rootDir, 'models');
const migrationsDir = argv.length > 1
    ? path.resolve(argv[1])
    : path.resolve(modelsDir, 'migration');

const config = require(path.join(rootDir, '/config.js'));
const connect = require(path.join(rootDir, '/modules/mongoose.js'))(config.mongoose);
let mongoose;

process.on('uncaughtException', (err) => {
    console.error(err.message, err.stack);
    process.exit(1);
});

console.log('Load models');

let models = glob.sync('*.js', {cwd: modelsDir})
.reduce((result, modelPath) => {
    console.log('- %s', modelPath);

    try {
        Object.assign(result, require(path.join(modelsDir, modelPath)));
    } catch (err) {
        console.error(err);
    }
    return result;
}, {});

console.log('Load migrations');

let queue = [];
let migrations = new Map();

_.forOwn(models, (model, name) => {
    queue.push({
        name,
        model,
    });

    let versionsDir = name[0].toLowerCase() + name.slice(1);
    let dir = path.join(migrationsDir, versionsDir);
    let collection = model.prototype.collection.name;

    migrations.set(collection, new Map());

    glob.sync('*.js', {cwd: dir}).forEach((versionPath) => {
        let filePath = path.join(dir, versionPath);
        let version = parseInt(versionPath.slice(0, -3), 10);

        migrations.get(collection).set(version, require(filePath));
    });
});

console.log('Run migration');

connect.then((db) => {
    mongoose = db;
})
.then(() => Promise.map(queue, ({name, model}) => {
    let collection = model.prototype.collection.name;
    let version = model.prototype.schema.tree.version.default;
    let db = mongoose.connection.db;

    return Promise.props({
        name,
        collection,
        version,
        count: count(db, collection, version),
        countUnmatch: countUnmatch(db, collection, version),
        updates: migrateCollection(db, collection, version),
    });
})
.then((result) => {
    var table = new Table({
        head: [
            'model',
            'ver',
            'updated',
            'total',
        ]
    })
    result.forEach((report) => {
        table.push([report.name, report.version, report.countUnmatch, report.count]);
    });

    console.log(table.toString());
    process.exit(0);
})
.catch((err) => {
    console.error(err.message, err.stack);
    process.exit(1);
}));


function count(db, collection, version) {
    return db.collection(collection)
    .find({})
    .count();
}

function countUnmatch(db, collection, version) {
    return db.collection(collection)
    .find({
        version: {$ne: version},
    })
    .count();
}

function selectUnmatch(db, collection, version) {
    return db.collection(collection)
    .find({
        version: {$ne: version},
    })
    .limit(100)
    .toArray();
}

function updateDoc(doc, db, collection, version) {
    let migrate;

    if (! doc.version) {
        console.error(doc);
        throw new Error(`Document "${doc._id}" from collection "${collection}" has no version.`);
    }

    if (doc.version > version) {
        migrate = getPrevMigrate(migrations.get(collection).get(doc.version));
    }
    else if (doc.version < version) {
        migrate = getNextMigrate(migrations.get(collection).get(doc.version));
    }
    else {
        return;
    }

    return migrate(doc, collection, db);
}

function getNextMigrate(migration) {
    if (migration.nextUpdate) {
        return (function(migrate) {
            return function(doc, collection, db) {
                let update;
                if (typeof migrate === 'function') {
                    update = migrate(doc);
                }
                else {
                    update = migrate;
                }

                return db.collection(collection)
                .update({_id: doc._id}, update);
            };
        })(migration.nextUpdate);
    }
    else {
        return migration.next;
    }
}

function getPrevMigrate(migration) {
    if (migration.prevUpdate) {
        return (function(migrate) {
            return function(doc, collection, db) {
                let update;
                if (typeof migrate === 'function') {
                    update = migrate(doc);
                }
                else {
                    update = migrate;
                }

                if (! update) {
                    return;
                }

                return db.collection(collection)
                .update({_id: doc._id}, update);
            };
        })(migration.prevUpdate);
    }
    else {
        return migration.prev;
    }
}

function migrateCollection(db, collection, version) {
    return selectUnmatch(db, collection, version)
    .then((docs) => {
        if (! docs.length) {
            return 0;
        }

        return Promise.map(docs, (doc) =>
            updateDoc(doc, db, collection, version)
        )
        .then(() => migrateCollection(db, collection, version))
        .then((si) => docs.length + si);
    });
}
