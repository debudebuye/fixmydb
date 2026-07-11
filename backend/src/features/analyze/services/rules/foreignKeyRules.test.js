const { runForeignKeyCandidates, runMissingFkIndexes, runRelationshipBehavior } = require('./foreignKeyRules');
const { makeTable, makeColumn } = require('./test-utils');

describe('foreignKeyRules', () => {
  describe('foreignKeyCandidates', () => {
    it('suggests FK for name_id column when matching table exists', () => {
      const t = makeTable('posts', [makeColumn('user_id')]);
      const context = {
        tables: [makeTable('users', [makeColumn('id', 'SERIAL', { isPrimary: true })], [], ['id'])],
        tablePatterns: { posts: [] },
      };
      const result = runForeignKeyCandidates(t, context);
      const fkRec = result.recommendations.find(r => r.type === 'possible_foreign_key');
      expect(fkRec).toBeDefined();
      expect(fkRec.column).toBe('user_id');
    });

    it('does not suggest FK when constraint already exists', () => {
      const t = makeTable('posts', [makeColumn('user_id')], [{ column: 'user_id', references: { table: 'users', column: 'id' } }]);
      const context = {
        tables: [makeTable('users', [makeColumn('id', 'SERIAL', { isPrimary: true })], [], ['id'])],
        tablePatterns: { posts: [] },
      };
      const result = runForeignKeyCandidates(t, context);
      expect(result.recommendations.find(r => r.type === 'possible_foreign_key')).toBeUndefined();
    });

    it('skips polymorphic reference_id columns', () => {
      const t = makeTable('comments', [makeColumn('reference_id')]);
      const context = {
        tables: [makeTable('references', [makeColumn('id', 'SERIAL', { isPrimary: true })], [], ['id'])],
        tablePatterns: { comments: [] },
      };
      const result = runForeignKeyCandidates(t, context);
      expect(result.recommendations.find(r => r.type === 'possible_foreign_key')).toBeUndefined();
    });
  });

  describe('missingFkIndexes', () => {
    it('recommends index on FK column without index', () => {
      const t = makeTable('posts', [makeColumn('user_id')], [{ column: 'user_id', references: { table: 'users', column: 'id' } }], ['id'], []);
      const result = runMissingFkIndexes(t);
      const idxRec = result.recommendations.find(r => r.type === 'missing_index');
      expect(idxRec).toBeDefined();
      expect(idxRec.column).toBe('user_id');
    });

    it('skips FK column that is already indexed', () => {
      const t = makeTable('posts', [makeColumn('user_id')], [{ column: 'user_id', references: { table: 'users', column: 'id' } }], ['id'], [{ columns: ['user_id'] }]);
      const result = runMissingFkIndexes(t);
      expect(result.recommendations.find(r => r.type === 'missing_index')).toBeUndefined();
    });

    it('returns empty for table without foreign keys', () => {
      const t = makeTable('users', [makeColumn('id', 'INTEGER', { isPrimary: true })], [], ['id']);
      const result = runMissingFkIndexes(t);
      expect(result.recommendations).toHaveLength(0);
    });
  });

  describe('relationshipBehavior', () => {
    it('recommends ON DELETE behavior when FKs exist', () => {
      const t = makeTable('posts', [makeColumn('user_id')], [{ column: 'user_id', references: { table: 'users', column: 'id' } }]);
      const result = runRelationshipBehavior(t);
      const relRec = result.recommendations.find(r => r.type === 'relationship_behavior');
      expect(relRec).toBeDefined();
    });

    it('returns empty for table without FKs', () => {
      const t = makeTable('users', [makeColumn('id', 'INTEGER')]);
      const result = runRelationshipBehavior(t);
      expect(result.recommendations).toBeUndefined();
    });
  });
});
