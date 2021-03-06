package pl.joegreen.edward.communication.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.google.common.base.Preconditions;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import pl.joegreen.edward.communication.controller.exception.InsertInvalidDataException;
import pl.joegreen.edward.core.model.*;
import pl.joegreen.edward.core.model.communication.IdContainer;
import pl.joegreen.edward.core.model.communication.VolunteerExecutionsCountInfo;
import pl.joegreen.edward.persistence.dao.InvalidObjectException;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/internal/")
public class InternalRestController extends RestControllerBase {

	@RequestMapping(value = "project/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public Project getProjectById(@PathVariable Long id) {
		return getById(id, projectDao);
	}

	@RequestMapping(value = "project", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public List<Project> getAllProjects() {
		return projectDao.getAll();
	}

	@RequestMapping(value = "project/{id}/jobs", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public List<Job> getJobsByProjectId(@PathVariable Long id) {
		return jobDao.getJobsByProjectId(id);
	}

	@RequestMapping(value = "job/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public Job getJobById(@PathVariable Long id) {
		return getById(id, jobDao);
	}

	@RequestMapping(value = "job/{id}/tasks", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public List<Task> getTasksByJobId(@PathVariable Long id) {
		return taskDao.getTasksByJobId(id);
	}

	@RequestMapping(value = "task/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public Task getTaskById(@PathVariable Long id) {
		return getById(id, taskDao);
	}

	@RequestMapping(value = "task/{id}/executions", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public List<Execution> getExecutionsByTaskId(@PathVariable Long id) {
		return executionDao.getExecutionsByTaskId(id);
	}

	@RequestMapping(value = "task/{id}/status", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public TaskStatus getTaskStatus(@PathVariable Long id) {
		return taskDao.getTaskStatus(id);
	}

	@RequestMapping(value = "task/statuses/{identifiers}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public List<TaskStatus> getTasksStatuses(
			@PathVariable List<Long> identifiers) {
		return identifiers.stream().map(id -> taskDao.getTaskStatus(id))
				.collect(Collectors.toList());
	}

	@RequestMapping(value = "task/results/{identifiers}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public List<JsonData> getTasksResults(@PathVariable List<Long> identifiers) {
		return identifiers.stream().map(id -> {
			List<JsonData> result = jsonDataDao.getResultsByTaskId(id);
			if (result.isEmpty()) {
				return null;
			} else {
				return result.get(0);
			}
		}).collect(Collectors.toList());
	}

	@RequestMapping(value = "task/{id}/input", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public JsonData getInputByTaskId(@PathVariable Long id) {
		return jsonDataDao.getInputByTaskId(id);
	}

	@RequestMapping(value = "task/{id}/results", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public List<JsonData> getResultsByTaskId(@PathVariable Long id) {
		return jsonDataDao.getResultsByTaskId(id);
	}

	@RequestMapping(value = "execution/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public Execution getExecutionById(@PathVariable Long id) {
		return getById(id, executionDao);
	}

	@RequestMapping(value = "execution/{id}/result", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public JsonData getResultByExecutionId(@PathVariable Long id) {
		return jsonDataDao.getResultByExecutionId(id);
	}

	@RequestMapping(value = "data/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public JsonData getDataById(@PathVariable Long id) {
		return getById(id, jsonDataDao);
	}

	@RequestMapping(value = "project", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public IdContainer insertOrUpdateProject(
			@RequestBody Project project) {
		User user = userDao.getByName(loggedUserNameProvider.getLoggedUserName());
		project.setOwnerId(user.getId());
		return insertOrUpdate(project, projectDao);
	}

	@RequestMapping(value = "job", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public IdContainer insertOrUpdateJob(@RequestBody Job job) {
		return insertOrUpdate(job, jobDao);
	}

	@RequestMapping(value = "task", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public IdContainer insertOrUpdateTask(@RequestBody Task task) {
		return insertOrUpdate(task, taskDao);
	}

	@RequestMapping(value = "task/{id}/abort", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public void abortTask(@PathVariable Long id) {
		taskDao.abort(id);
	}

	@RequestMapping(value = "task/abort/{identifiers}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public void abortTasks(@PathVariable List<Long> identifiers) {
		logger.info("Aborting tasks: " + identifiers);
		for (long id : identifiers) {
			taskDao.abort(id);
		}
	}

	@RequestMapping(value = "data", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public IdContainer insertOrUpdateData(
			@RequestBody JsonData data) {
		return insertOrUpdate(data, jsonDataDao);
	}

	@RequestMapping(value = "project/{id}", method = RequestMethod.DELETE)
	public void deleteProjectById(@PathVariable Long id) {
		delete(id, projectDao);
	}

	@RequestMapping(value = "job/{id}", method = RequestMethod.DELETE)
	public void deleteJobById(@PathVariable Long id) {
		delete(id, jobDao);
	}

	@RequestMapping(value = "task/{id}", method = RequestMethod.DELETE)
	public void deleteTaskById(@PathVariable Long id) {
		delete(id, taskDao);
	}

	@RequestMapping(value = "data/{id}", method = RequestMethod.DELETE)
	public void deleteDataById(@PathVariable Long id) {
		delete(id, jsonDataDao);
	}

	@RequestMapping(value = "job/{jobId}/tasks/{priority}/{parallelExecutions}/{timeout}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public List<Long> addManyTasks(@PathVariable Long jobId,
			@PathVariable Long priority, @PathVariable Long parallelExecutions,
			@PathVariable Long timeout, @RequestBody String dataForTasks) {
		ObjectMapper objectMapper = new ObjectMapper();
		try {
			JsonNode taskInputsJson = objectMapper.readTree(dataForTasks);
			if (!taskInputsJson.isArray()) {
				throw new InsertInvalidDataException(
						"Cannot parse input string as a json array");
			}
			List<Long> addedIdentifiers = new ArrayList<Long>();
			ArrayNode taskInputsJsonArray = (ArrayNode) taskInputsJson;
			for (JsonNode node : taskInputsJsonArray) {
				JsonData data = new JsonData(node.toString());
				jsonDataDao.insert(data);
				Task task = new Task();
				task.setJobId(jobId);
				task.setPriority(priority);
				task.setTimeout(timeout);
				task.setConcurrentExecutionsCount(parallelExecutions);
				task.setInputDataId(data.getId());
				taskDao.insert(task);
				addedIdentifiers.add(task.getId());
			}
			return addedIdentifiers;
			// TODO: transactional?
		} catch (InvalidObjectException | IOException ex) {
			throw new InsertInvalidDataException(
					"Cannot parse input string as a json array", ex);
		}
	}

	@RequestMapping("volunteerCount")
	public long getVolunteerCount() {
		return volunteerManagerService.getNumberOfConnectedVolunteers();
	}

}
