import app from "./app";
import { envVars } from "./config/env";

const boostrap = () => {
  try {
    app.listen(envVars.PORT, ()=>{
      console.log(`Server is running o http://localhost:${envVars.PORT}`);
    })
  } catch (error) {
   console.log('Feild to start server',error); 
  }
}

boostrap()