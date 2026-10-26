jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

const crypto = require('crypto');
const { query } = require('../config/database');
const repository = require('./financeRegistersRepository');

describe('syncHomeAffairsEmployers', () => {
  beforeEach(() => query.mockReset());

  it('adds only Home Affairs government employers missing from the catalogue', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ name: 'Ministry of Works' }, { name: 'Ministry of Health' }],
      })
      .mockResolvedValueOnce({
        rows: [{ normalized_name: 'ministry of health' }],
      })
      .mockResolvedValueOnce({
        rows: [{
          id: 'new-employer-id',
          code: `HA_${crypto.createHash('sha256').update('ministry of works').digest('hex').slice(0, 32)}`,
          name: 'Ministry of Works',
          isActive: true,
        }],
      });

    const synced = await repository.syncHomeAffairsEmployers();

    expect(synced).toEqual([{
      id: 'new-employer-id',
      code: `HA_${crypto.createHash('sha256').update('ministry of works').digest('hex').slice(0, 32)}`,
      name: 'Ministry of Works',
      isActive: true,
    }]);
    expect(query).toHaveBeenCalledTimes(3);
    expect(query.mock.calls[2][0]).toContain('ON CONFLICT (code) DO UPDATE');
    expect(query.mock.calls[2][0]).not.toContain('is_active =');
    expect(query.mock.calls[2][1]).toEqual([synced[0].code, 'Ministry of Works']);
  });

  it('does not insert an employer already present regardless of letter case', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ name: 'Ministry of Health' }] })
      .mockResolvedValueOnce({ rows: [{ normalized_name: 'ministry of health' }] });

    await expect(repository.syncHomeAffairsEmployers()).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(2);
  });
});
