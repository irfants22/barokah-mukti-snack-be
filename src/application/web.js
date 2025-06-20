import express from "express";
import cors from "cors";

export const web = express();
web.use(cors());
web.use(express.json());
