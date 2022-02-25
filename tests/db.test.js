import { deleteRow, insert, query } from '../src/lib/db';

describe('insert event', () => {
	it('inserts event into events', async () => {
		const input = {
			name: 'insert test',
			slug: 'insert-test',
		};

		const output = await insert(input);
		expect(output).toBe(true);
	});
});

describe('select event', () => {
	it('selects event where name = insert test', async () => {
		const input = [
			'insert test'
        ];

		const queryResult = await query('SELECT slug FROM events WHERE name = $1',input);
        const result = queryResult.rows[0].slug;
		expect(result).toBe('insert-test');
	});
});

describe('delete event', () => {
	it('delets event where name = insert test', async () => {
		const input = [
			'insert test'
        ];

		const idQuery = await query('SELECT id FROM events WHERE name = $1',input);
        const queryResult = await deleteRow(idQuery.rows[0].id)
        const result = queryResult[0].slug;
		expect(result).toBe('insert-test');
	});
});
