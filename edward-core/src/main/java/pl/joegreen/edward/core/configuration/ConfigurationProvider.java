package pl.joegreen.edward.core.configuration;

public interface ConfigurationProvider {

	String getValue(Parameter parameter);

	long getValueAsLong(Parameter parameter);

	int getValueAsInt(Parameter parameter);
}
