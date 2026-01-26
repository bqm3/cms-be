const { User, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initAdmin = async () => {
  try {
    await sequelize.sync();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [user, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: hashedPassword,
        role: 'admin'
      }
    });

    if (created) {
      console.log('Admin user created: admin / admin123');
    } else {
      console.log('Admin user already exists');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

initAdmin();
