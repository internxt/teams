const expect = require('chai').expect;
const { describe, it } = require('mocha');
const SanitizeFilename = require('sanitize-filename');
const utilsService = require('../../app/services/utils');
const logger = require('../../lib/logger');

const Config = require('../../config/config');
const Server = require('../../config/initializers/server');

const App = new Server(new Config());
const utils = utilsService(null, App);

const validBucketIds = ['aaaaaaaaaaaaaaaaaaaaaaaa', '154785478541256987458987'];

const validDatabaseIds = [0, 999, 54125, 14, 12566];

describe('# Utils', function () {
  describe('# isBucketId', function () {
    validBucketIds.forEach((bucketId, index) => {
      it('bucket id ' + bucketId + ' should be valid', () => {
        expect(utils.IsBucketId(bucketId)).to.be.true;
      });
    });

    validDatabaseIds.forEach((databaseId) => {
      it('database id ' + databaseId + ' should NOT be valid bucket id', () => {
        expect(utils.IsBucketId(databaseId)).to.be.false;
      });
    });
  });

  describe('# isDatabaseId', function () {
    validBucketIds.forEach((bucketId) => {
      it('bucket id ' + bucketId + ' should NOT be valid database id', () => {
        expect(utils.IsDatabaseId(bucketId)).to.be.false;
      });
    });

    validDatabaseIds.forEach((databaseId) => {
      it('database id ' + databaseId + ' should be valid', () => {
        expect(utils.IsDatabaseId(databaseId)).to.be.true;
      });
    });

    it('invalid databaseIds', () => {
      expect(utils.IsDatabaseId(Number.MAX_VALUE)).to.be.false;
      expect(utils.IsDatabaseId(Number.MAX_SAFE_INTEGER)).to.be.true;
    });
  });
});
