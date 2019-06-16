const BigNumber = require('bignumber.js');
const defaultTo = require('lodash/defaultTo');
const { ValidationError } = require('../common/errors');
const { DEFAULT_LIMIT, DEFAULT_PAGE } = require('../constants/resolvers');

/**
 * Validates and normalizes page and limit arguments
 * If provided page or limit is negative throws a Validation error
 *
 * @param {{page: String, limit: String}} args
 * @returns {{page: String, limit: String}}
 */
const validatePagination = args => {
  const limit = new BigNumber(defaultTo(args.limit, DEFAULT_LIMIT));
  const page = new BigNumber(defaultTo(args.page, DEFAULT_PAGE));

  if (limit.lte(0)) {
    throw new ValidationError('limit must not be negative or zero');
  }

  if (page.lte(0)) {
    throw new ValidationError('page must not be negative or zero');
  }

  return {
    page: page.toString(),
    limit: limit.toString()
  };
};

/**
 * Calculate the offset based on pagingation and returns a formated object
 *
 * @param {{limit: String, page: String}} param0
 * @returns {{limit: String, offset: String}}
 */
const withPagination = ({ limit, page }) => ({
  limit,
  offset: (new BigNumber(page)).minus(1).times(limit).toString()
});

module.exports = {
  validatePagination,
  withPagination
};
