package pl.joegreen.edward.core.utils;

import java.time.LocalDateTime;
import java.time.ZoneId;

public class DateTimeUtils {

    public static Long localDateTimeInMilliseconds(LocalDateTime date) {
        return date.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    public static boolean isAfterOrEqual(LocalDateTime from, LocalDateTime to) {
        return to.isAfter(from) || to.isEqual(from);
    }

}
