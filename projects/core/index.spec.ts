import {expect} from 'chai';
import {foo} from './index';

describe('PlaceholderTestSuite', function () {

  it('Placeholder export should be 1', () => {
    expect(foo).to.eq(1);
  });
});
