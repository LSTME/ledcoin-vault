module.exports = (sequelize, DataTypes) => {
  const bounty = sequelize.define('bounty', {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    description: DataTypes.TEXT,
    value: {
      type: DataTypes.INTEGER,
    },
    code: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    targetId: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    urlKey: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
  }, {
    getterMethods: {},
  });
  bounty.associate = (models) => {
  };
  return bounty;
};
