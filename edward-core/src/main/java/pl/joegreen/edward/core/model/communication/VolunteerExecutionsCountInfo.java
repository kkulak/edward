package pl.joegreen.edward.core.model.communication;

public class VolunteerExecutionsCountInfo {
    private final Long volunteerId;
    private final Long executionsCount;

    public VolunteerExecutionsCountInfo(Long volunteerId, Long executionsCount) {
        this.volunteerId = volunteerId;
        this.executionsCount = executionsCount;
    }

    public Long getVolunteerId() {
        return volunteerId;
    }

    public Long getExecutionsCount() {
        return executionsCount;
    }
}
