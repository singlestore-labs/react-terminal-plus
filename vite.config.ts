import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// only being used fot Cypress Component Testing
export default defineConfig({
	plugins: [react()],
});
