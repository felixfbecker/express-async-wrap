import express from 'express';
import request from 'supertest';
import wrap from '../src';

function makeResult(result) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), 10);
  });
}

describe('express-async-wrap', function() {

  it('should await any promises', function(done) {
    const app = express();
    app.get('/', wrap(async function(req, res) {
      const results = [];

      for(let i = 0; i < 5; i++) {
        results.push(makeResult(`test${i}`));
      }

      res.send((await* results).join());
    }));

    request(app)
      .get('/')
      .expect((res) => {
        expect(res.text).toBe('test0,test1,test2,test3,test4');
      })
      .end(done);
  });

  it('should be able to be used as an error handler', function(done) {
    const app = express();
    app.get('/', wrap(async function(req, res, next) {
      next(new Error('error'));
    }));
    app.use(wrap(async function(err, req, res, next) { // eslint-disable-line no-unused-vars
      res.status(500).send('error');
    }));

    request(app)
      .get('/')
      .expect(500)
      .expect((res) => {
        expect(res.text).toBe('error');
      })
      .end(done);
  });
});
