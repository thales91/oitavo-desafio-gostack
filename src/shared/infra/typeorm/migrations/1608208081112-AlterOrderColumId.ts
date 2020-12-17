import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AlterOrderColumId1608208081112
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'customerId',
        type: 'uuid',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'customerId');
  }
}
