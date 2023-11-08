import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dependencies } from "./package.json";
import path from "path";

const ENV_VARIABLES = {
	"react-terminal-plus-version": dependencies["react-terminal-plus"],
};
type EnvVariables = typeof ENV_VARIABLES;

export default defineConfig({
	resolve: {
		alias: {
			"react-terminal-plus-local": path.resolve("../src"),
		},
	},
	define: {
		"process.env": ENV_VARIABLES,
	},
	plugins: [react()],
});

declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvVariables {}
	}
}
