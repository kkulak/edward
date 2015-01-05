package pl.joegreen.edward.charles.configuration;

import java.io.File;
import java.util.List;

import org.apache.commons.io.FileUtils;

import pl.joegreen.edward.charles.PhaseType;

public class CodeReader {

	public static String readCode(List<String> codeFiles, PhaseType phaseType) {
		StringBuilder builder = new StringBuilder();
		builder.append("(function(){ \n");
		builder.append("\n/* Code generated by Charles */\n");
		codeFiles.stream().forEach(path -> {
			try {
				builder.append("\n/* Code from file: " + path + " */\n");
				// TODO: encoding
				builder.append(FileUtils.readFileToString(new File(path)));
			} catch (Exception e) {
				// TODO: handle
				throw new RuntimeException(e);
			}
		});

		builder.append(";\n return ");
		switch (phaseType) {
		case GENERATE:
			builder.append("generate; ");
			break;
		case IMPROVE:
			builder.append("function(input){return improve(input.population, input.parameters)}");
			break;
		case MIGRATE:
			builder.append("function(input){return {populations: migrate(input.populations, input.parameters)}}");
			break;
		}
		builder.append("\n/* End of code generated by Charles */\n");
		builder.append("}())");
		return builder.toString();
	}
}
