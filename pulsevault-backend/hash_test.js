const bcrypt = require('bcrypt');

(async () => {
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    console.log("New Hashed Password:", hashedPassword);
})();
