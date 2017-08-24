module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bounties', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
      },
      value: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      targetId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      urlKey: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
    });
    await queryInterface.addIndex('bounties', ['targetId']);
    await queryInterface.addIndex('bounties', ['createdAt']);
    await queryInterface.addIndex('bounties', ['updatedAt']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('bounties', ['updatedAt']);
    await queryInterface.removeIndex('bounties', ['createdAt']);
    await queryInterface.removeIndex('bounties', ['targetId']);
    await queryInterface.dropTable('bounties');
  },
};
