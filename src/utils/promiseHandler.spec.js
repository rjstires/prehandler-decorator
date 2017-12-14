import Promise from 'bluebird';

function wrapMethod(method) {
  return function promise(data) {
    return new Promise((resolve, reject) => {
      let result;
      try {
        result = method(data);
        return resolve(result)
      } catch (error) {
        return reject(error);
      }
    });
  }
}

function prehandler(...pre) {
  return Promise.reduce(pre, (handlerResult, { assign, method }) => {
    let handler = (method.then)
    ? method
    : wrapMethod(method);
    
    return handler(handlerResult)
      .then((promiseResult) => ({ ...handlerResult, [assign]: promiseResult }))
      .catch((promiseError) => ({ ...handlerResult, [assign]: promiseError }));
  }, {});
}

describe('utils/promiseHandler', () => {
  it('should return a Promise', () => {
    const handlerA = { assign: 'someProp', method() { return Promise.resolve('some value....') } }
    expect(prehandler(handlerA)).toBeInstanceOf(Promise);
  });

  it('should handle synchronous handlers', () => {
    const fnA = jest.fn(() => 'RESULT SYNC A');
    const fnB = jest.fn(() => 'RESULT SYNC B');
    const fnC = jest.fn(() => 'RESULT SYNC C');

    const handlerA = {
      assign: 'fnA',
      method: fnA
    };

    const handlerB = {
      assign: 'fnB',
      method: fnB
    };

    const handlerC = {
      assign: 'fnC',
      method: fnC
    };

    return prehandler(handlerA, handlerB, handlerC)
      .then((result) => {
        expect(fnA).toHaveBeenCalledTimes(1);
        expect(fnA).toBeCalledWith({});
        
        expect(fnB).toHaveBeenCalledTimes(1);
        expect(fnB).toBeCalledWith({ fnA: 'RESULT SYNC A' });
        
        expect(fnC).toHaveBeenCalledTimes(1);
        expect(fnC).toBeCalledWith({ fnA: 'RESULT SYNC A', fnB: 'RESULT SYNC B' });
        
        expect(result).toEqual({ fnA: 'RESULT SYNC A', fnB: 'RESULT SYNC B', fnC: 'RESULT SYNC C' });
      });
  });

  it('should handle asynchonous handlers', () => {
    const promiseA = jest.fn((pre) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          return resolve('RESULT A');
        }, 350);
      });
    });

    const promiseB = jest.fn((pre) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          return resolve('RESULT B');
        }, 150);
      });
    });

    const promiseC = jest.fn((pre) => {
      return Promise.resolve('RESULT C');
    });

    const handlerA = {
      assign: 'a',
      method: promiseA
    };

    const handlerB = {
      assign: 'b',
      method: promiseB
    };

    const handlerC = {
      assign: 'c',
      method: promiseC
    };

    return prehandler(handlerA, handlerB, handlerC)
      .then((result) => {
        expect(result).toEqual({ a: 'RESULT A', b: 'RESULT B', c: 'RESULT C' });

        expect(promiseA).toHaveBeenCalledTimes(1);
        expect(promiseA).toHaveBeenCalledWith({});

        expect(promiseB).toHaveBeenCalledTimes(1);
        expect(promiseB).toHaveBeenCalledWith({ a: 'RESULT A' });

        expect(promiseC).toHaveBeenCalledTimes(1);
        expect(promiseC).toHaveBeenCalledWith({ a: 'RESULT A', b: 'RESULT B' });
      });
  });

  it('should handle asynchonous handler errors graciously', () => {
    const promiseA = jest.fn((pre) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          return resolve('RESULT A');
        }, 350);
      });
    });

    const promiseB = jest.fn((pre) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          return reject(new Error(`Error, error, you've probably done something stupid.`));
        }, 150);
      });
    });

    const promiseC = jest.fn((pre) => {
      return Promise.resolve('RESULT C');
    });

    const handlerA = {
      assign: 'a',
      method: promiseA
    };

    const handlerB = {
      assign: 'b',
      method: promiseB
    };

    const handlerC = {
      assign: 'c',
      method: promiseC
    };

    return prehandler(handlerA, handlerB, handlerC)
      .then((result) => {
        expect(result).toHaveProperty('a', 'RESULT A');
        expect(result).toHaveProperty('c', 'RESULT C');
        expect(result).toHaveProperty('b');
        expect(result.b).toBeInstanceOf(Error);
      });
  });


  it('should handle mixed synchronous and asynchonous handlers', () => {
    const fnA = { assign: 'fnA', method: () => Promise.resolve('fnA') };
    const fnB = { assign: 'fnB', method: () => 'fnB' };
    const fnC = { assign: 'fnC', method: () => Promise.resolve('fnC') };
    const fnD = { assign: 'fnD', method: () => 'fnD' };
    const fnE = { assign: 'fnE', method: () => Promise.resolve('fnE') };

    return prehandler(fnA, fnB, fnC, fnD, fnE)
      .then((results) => {
        expect(results).toEqual({ fnA: 'fnA', fnB: 'fnB', fnC: 'fnC', fnD: 'fnD', fnE: 'fnE' });
      })
  });
});