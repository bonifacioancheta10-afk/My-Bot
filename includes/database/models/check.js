module.exports = (sequelize, DataTypes) => {
  const Check = sequelize.define("Check", {
    threadID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return Check;
};
