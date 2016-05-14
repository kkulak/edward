package pl.joegreen.edward.persistence.dao;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import pl.joegreen.edward.core.model.communication.VolunteerExecutionsCountInfo;
import pl.joegreen.edward.persistence.generated.Tables;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.jooq.impl.DSL.count;
import static pl.joegreen.edward.core.model.ExecutionStatus.*;
import static pl.joegreen.edward.core.utils.DateTimeUtils.endOfDayInMilliseconds;
import static pl.joegreen.edward.core.utils.DateTimeUtils.startOfDayInMilliseconds;

@Component
public class MetricsDao {
    @Autowired
    private final DSLContext dslContext;

    @Autowired
    public MetricsDao(DSLContext dslContext) {
        this.dslContext = dslContext;
    }

    public List<VolunteerExecutionsCountInfo> successfulVolunteerExecutionsCountInfo(LocalDate from, LocalDate to) {
        return volunteerExecutionsCountInfoMeetingCondition(isExecutionSuccessful().and(isExecutedWithin(from, to)));
    }

    public List<VolunteerExecutionsCountInfo> failingVolunteerExecutionsCountInfo(LocalDate from, LocalDate to) {
        return volunteerExecutionsCountInfoMeetingCondition(isExecutionFailing().and(isExecutedWithin(from, to)));
    }

    private List<VolunteerExecutionsCountInfo> volunteerExecutionsCountInfoMeetingCondition(Condition condition) {
        return dslContext
                .select(Tables.EXECUTIONS.VOLUNTEER_ID, count())
                .from(Tables.EXECUTIONS)
                .where(condition)
                .groupBy(Tables.EXECUTIONS.VOLUNTEER_ID)
                .orderBy(count().desc())
                .fetchInto(VolunteerExecutionsCountInfo.class);
    }

    private Condition isExecutionSuccessful() {
        return Tables.EXECUTIONS.STATUS.eq(FINISHED.toString());
    }

    private Condition isExecutionFailing() {
        return Tables.EXECUTIONS.STATUS.in(Arrays.asList(ABORTED.toString(), TIMEOUT.toString(), FAILED.toString()));
    }

    private Condition isExecutedWithin(LocalDate from, LocalDate to) {
        return Tables.EXECUTIONS.COMPLETION_TIME.between(startOfDayInMilliseconds(from), endOfDayInMilliseconds(to));
    }

}
