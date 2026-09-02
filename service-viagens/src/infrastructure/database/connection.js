import configs from '../config/database.js';
import {Pool} from "pg";

const pool = new Pool(configs);

export default pool;