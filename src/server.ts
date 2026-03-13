import app from "./app";
import { seedSuperAdmin } from "./app/utils/seed";
import { envVars } from "./config/env";

const boostrap = async () => {
  try {
    await seedSuperAdmin()
    app.listen(envVars.PORT, () => {
      console.log(`Server is running o http://localhost:${envVars.PORT}`);
    })
  } catch (error) {
    console.log('Feild to start server', error);
  }
}

boostrap()