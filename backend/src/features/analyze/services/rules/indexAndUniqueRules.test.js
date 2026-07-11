const { runCompositeIndex, runUniqueAndIndexColumns, runCompositeUnique } = require('./indexAndUniqueRules');
const { makeTable, makeColumn } = require('./test-utils');

describe('indexAndUniqueRules', () => {
  describe('compositeIndex', () => {
    it('recommends composite index for user_id + created_at', () => {
      const t = makeTable('posts', [makeColumn('user_id'), makeColumn('created_at')], [], ['id']);
      const result = runCompositeIndex(t);
      const rec = result.recommendations.find(r => r.type === 'missing_composite_index');
      expect(rec).toBeDefined();
    });

    it('skips composite index when it already exists', () => {
      const t = makeTable('posts', [makeColumn('user_id'), makeColumn('created_at')], [], ['id'], [{ columns: ['user_id', 'created_at'] }]);
      const result = runCompositeIndex(t);
      expect(result.recommendations).toBeUndefined();
    });
  });

  describe('uniqueAndIndexColumns', () => {
    it('recommends unique for email column', () => {
      const t = makeTable('users', [makeColumn('email')], [], ['id']);
      const result = runUniqueAndIndexColumns(t);
      expect(result.recommendations.find(r => r.type === 'missing_unique')).toBeDefined();
    });

    it('recommends index for email column', () => {
      const t = makeTable('users', [makeColumn('email')], [], ['id']);
      const result = runUniqueAndIndexColumns(t);
      expect(result.recommendations.filter(r => r.type === 'missing_index').length).toBeGreaterThanOrEqual(1);
    });

    it('skips email when already unique', () => {
      const t = makeTable('users', [makeColumn('email', 'VARCHAR', { isUnique: true })], [], ['id']);
      const result = runUniqueAndIndexColumns(t);
      expect(result.recommendations.find(r => r.type === 'missing_unique')).toBeUndefined();
    });

    it('recommends index for sku column', () => {
      const t = makeTable('products', [makeColumn('sku')], [], ['id']);
      const result = runUniqueAndIndexColumns(t);
      expect(result.recommendations.find(r => r.type === 'missing_index' && r.column === 'sku')).toBeDefined();
    });
  });

  describe('compositeUnique', () => {
    it('recommends composite unique for order_items', () => {
      const t = makeTable('order_items', [makeColumn('order_id'), makeColumn('product_id')], [], ['id']);
      const result = runCompositeUnique(t);
      const rec = result.recommendations.find(r => r.type === 'composite_unique');
      expect(rec).toBeDefined();
    });

    it('skips non-order table', () => {
      const t = makeTable('users', [makeColumn('email')], [], ['id']);
      const result = runCompositeUnique(t);
      expect(result.recommendations).toBeUndefined();
    });
  });
});
