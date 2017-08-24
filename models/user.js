module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    username: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    photo: DataTypes.STRING,
    dateOfBirth: DataTypes.DATEONLY,
    walletId: DataTypes.INTEGER,
    password: DataTypes.STRING,
    admin: DataTypes.BOOLEAN,
  }, {
    getterMethods: {},
  });
  user.associate = (models) => {
    user.hasMany(models.transaction, { foreignKey: 'walletId', sourceKey: 'walletId' });
  };
  return user;
};
