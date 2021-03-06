package pl.joegreen.edward.communication.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.h2.tools.RunScript;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import pl.joegreen.edward.communication.Start;
import pl.joegreen.edward.core.configuration.ConfigurationProvider;
import pl.joegreen.edward.persistence.configuration.DataSourceConfig;
import pl.joegreen.edward.persistence.dao.*;
import pl.joegreen.edward.persistence.testkit.ModelFixtures;

import javax.sql.DataSource;
import java.io.InputStreamReader;
import java.sql.SQLException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = {Start.class, AddModelFixturesConfiguration.class})
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
@Ignore
public class RestControllerTestBase {

    @Autowired
    protected WebApplicationContext WebApplicationContext;
    @Autowired
    protected ProjectDao projectDao;
    @Autowired
    protected JobDao jobDao;
    @Autowired
    protected JsonDataDao jsonDataDao;
    @Autowired
    protected TaskDao taskDao;
    @Autowired
    protected UserDao userDao;
    @Autowired
    protected ExecutionDao executionDao;

    @Autowired
    protected VolunteerDao volunteerDao;

    @Autowired
    protected ModelFixtures modelFixtures;

    @Autowired
    protected ConfigurationProvider configurationProvider;

    @Autowired
    private DataSource dataSource;

    protected ObjectMapper mapper = new ObjectMapper();

    protected MockMvc mockMvc;

    protected final static MediaType JSON = MediaType.APPLICATION_JSON;

    @Before
    public void initializeEmptyDatabaseSchema() throws SQLException {
        RunScript.execute(dataSource.getConnection(), new InputStreamReader(
                DataSourceConfig.class.getClassLoader()
                        .getResourceAsStream("createSchema.sql")));
    }

    protected ResultMatcher OK = status().isOk();
    protected ResultMatcher NOT_FOUND = status().isNotFound();
    protected ResultMatcher BAD_REQUEST = status().isBadRequest();
    protected ResultMatcher EMPTY_CONTENT = content().string("");

    protected final static String VOLUNTEER_API_URL_BASE = "/api/volunteer";
    protected final static String INTERNAL_API_URL_BASE = "/api/internal";
    protected final static String DATA_URL = INTERNAL_API_URL_BASE + "/data";
    protected final static String PROJECT_URL = INTERNAL_API_URL_BASE
            + "/project";
    protected final static String JOB_URL = INTERNAL_API_URL_BASE + "/job";
    protected final static String TASK_URL = INTERNAL_API_URL_BASE + "/task";

    protected ResultMatcher contentEqualsByJson(Object object)
            throws JsonProcessingException {
        return content().string(mapper.writeValueAsString(object));
    }

    protected String idUrl(long id) {
        return "/" + id;
    }

    protected String performGetAndReturnContent(String url) throws Exception {
        return mockMvc.perform(get(url).accept(JSON)).andExpect(OK).andReturn()
                .getResponse().getContentAsString();
    }

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(WebApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

}
