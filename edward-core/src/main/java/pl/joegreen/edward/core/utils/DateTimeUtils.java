package pl.joegreen.edward.core.utils;

import java.time.LocalDate;
import java.time.ZoneId;

public class DateTimeUtils {

    public static Long startOfDayInMilliseconds(LocalDate date) {
        return date.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    public static Long endOfDayInMilliseconds(LocalDate date) {
        return date.atTime(23, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    public static boolean isAfterOrEqual(LocalDate from, LocalDate to) {
        return to.isAfter(from) || to.isEqual(from);
    }

}
