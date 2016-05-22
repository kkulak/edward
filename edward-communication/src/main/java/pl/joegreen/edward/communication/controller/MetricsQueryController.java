package pl.joegreen.edward.communication.controller;

import com.google.common.base.Preconditions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.joegreen.edward.core.model.communication.VolunteerExecutionsCountInfo;
import pl.joegreen.edward.persistence.dao.MetricsDao;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static pl.joegreen.edward.core.utils.DateTimeUtils.isAfterOrEqual;

@RestController
@RequestMapping("/api/internal/metrics/")
public class MetricsQueryController {
    private final MetricsDao metricsDao;

    @Autowired
    public MetricsQueryController(MetricsDao metricsDao) {
        this.metricsDao = metricsDao;
    }

    @RequestMapping(value = "volunteer-executions", params = "type=successful")
    public List<VolunteerExecutionsCountInfo> successfulVolunteerExecutionsCountInfo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        Preconditions.checkArgument(isAfterOrEqual(from, to), "End date must be after or equal start one");
        return metricsDao.successfulVolunteerExecutionsCountInfo(from, to);
    }

    @RequestMapping(value = "volunteer-executions", params = "type=failing")
    public List<VolunteerExecutionsCountInfo> failingVolunteerExecutionsCountInfo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        Preconditions.checkArgument(isAfterOrEqual(from, to), "End date must be after or equal start one");
        return metricsDao.failingVolunteerExecutionsCountInfo(from, to);
    }

}
