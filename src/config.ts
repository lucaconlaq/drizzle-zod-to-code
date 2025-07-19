import { readFileSync, existsSync, readdirSync, writeFileSync, unlinkSync, statSync } from "node:fs";

import { join, resolve } from "node:path";
import { transform } from "esbuild";

export interface CommandOptions {
	config: string;
	out: string;
	tsConfig: string;
}

export interface Config {
	tsConfigPath: string;
	schemaFiles: string[];
	out: string | null;
}

export const parseConfig = async (options: CommandOptions): Promise<Config> => {
	const configPath = resolve(process.cwd(), options.config);
	const tsConfigPath = resolve(process.cwd(), options.tsConfig);

	if (!existsSync(configPath)) {
		throw new Error(`Drizzle config file not found at ${configPath}`);
	}
	if (!existsSync(tsConfigPath)) {
		throw new Error(`TypeScript config file not found at ${tsConfigPath}`);
	}

	// Read and transform the drizzle config file
	const configContent = readFileSync(configPath, "utf8");
	const { code } = await transform(configContent, {
		loader: "ts",
		format: "esm",
	});

	// Write transformed code to a temporary file
	const tempFile = join(process.cwd(), "temp-config.mjs");
	writeFileSync(tempFile, code);

	try {
		// Import the temporary module
		const module = await import(tempFile);
		const config = module.default;

		if (!config || !config.schema) {
			throw new Error("Could not find schema path in drizzle config");
		}

		const schemaPath = resolve(process.cwd(), config.schema);
		if (!existsSync(schemaPath)) {
			throw new Error(`Schema path not found at ${schemaPath}`);
		}

		const stats = statSync(schemaPath);
		let schemaFiles: string[];

		if (stats.isFile()) {
			if (!schemaPath.endsWith(".ts")) {
				throw new Error(`Schema file must be a TypeScript file: ${schemaPath}`);
			}
			schemaFiles = [schemaPath];
		} else if (stats.isDirectory()) {
			schemaFiles = readdirSync(schemaPath)
				.filter((file) => file.endsWith(".ts"))
				.map((file) => join(schemaPath, file));
		} else {
			throw new Error(`Schema path must be a file or directory: ${schemaPath}`);
		}

		return {
			tsConfigPath,
			schemaFiles,
			out: options.out,
		};
	} finally {
		// Clean up temporary file
		unlinkSync(tempFile);
	}
};
