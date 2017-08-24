module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      firstName: {
        type: Sequelize.DataTypes.STRING,
      },
      lastName: {
        type: Sequelize.DataTypes.STRING,
      },
      username: {
        type: Sequelize.DataTypes.STRING,
      },
      photo: {
        type: Sequelize.DataTypes.STRING,
      },
      dateOfBirth: {
        type: Sequelize.DataTypes.DATEONLY,
      },
      walletId: {
        type: Sequelize.DataTypes.INTEGER,
      },
      password: {
        type: Sequelize.DataTypes.STRING,
      },
      admin: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex('users', ['username'], { indicesType: 'UNIQUE' });
    await queryInterface.addIndex('users', ['createdAt']);
    await queryInterface.addIndex('users', ['updatedAt']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', ['updatedAt']);
    await queryInterface.removeIndex('users', ['createdAt']);
    await queryInterface.removeIndex('users', ['username'], { indicesType: 'UNIQUE' });
    await queryInterface.dropTable('users');
  },
};
