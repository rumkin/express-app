'use strict';

const fargs = require('function-arguments');

class Store extends Map {
    constructor() {
        super(...arguments);
        
        this.factories = new Map();
        this.values = new Map();
    }
    
    define(name, factory) {
        if (typeof factory !== 'function') {
            throw new Error(`Argument #2 should be a function`);
        }
        this.factories.set(name, factory);
    }
    
    init(name) {
        if (! this.factories.has(name)) {
            throw new Error(`Factory "${name}" not found`);
        }
        
        let result = this.factories.get(name)(this);
        
        if (isThenable(result)) {
            return result.then((value) => {
                this.values.set(name, value);
            });
        }
        else {
            this.set(name, result);
            return result;
        }
        
    }
    
    set(name, value) {
        if (this.has(name)) {
            throw new Error(`Name "${name}" already set`);
        }
        this.values.set(name, value);
    }
    
    get(name) {
        if (this.values.has(name)) {
            return this.values.get(name);
        }
        else if (this.factories.has(name)) {
            return this.init(name);
        }
        else {
            throw new Error(`Component "${name}" not found.`);
        }
    }
    
    has(name) {
        return this.values.has(name) || this.factories.has(name);
    }
    
    run(...names) {
        let fn = names.pop();
        if (typeof fn !== 'function') {
            throw new Error('Last argument should be a function');
        }
        
        if (names.length > 1) {
            if (Array.isArray(names[0])) {
                names = names[0];
            }
        }
        else {
            names = fargs(fn);
        }
        
        let values = [];
        
        names.forEach((name) => {
            values.push(this.get(name));
        });
        
        return Promise.all(values).then((args) => fn(...args));
    }
    
    use(fn) {
        fn(this);
        return this;
    }
}

module.exports = new Proxy(Store, {
    construct(Store, args) {
        let instance = new Store(...args);
        
        let proxy = new Proxy(instance, {
            set(self, name, value) {
                self.set(name, value);
                return true;
            },
            
            get(self, name) {
                if (name === 'use') {
                    return (fn) => {
                        fn(proxy);
                        return proxy;
                    };
                }
                else if (typeof self[name] === 'function') {
                    return self[name].bind(self);
                }
                
                if (! self.has(name)) {
                    throw new Error(`Module "${name.toString()}" not defined`);
                }
                return self.get(name);
            },
            
            has(self, name) {

                if (typeof self[name] === 'function') {
                    return true;
                }
                return this.has(name);
            },
        });
        
        return proxy;
    },
});

function isThenable(value) {
    return typeof value.then === 'function';
}