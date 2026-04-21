import { useCallback, useState } from "react";
import ListSchedule from "./_components/list";
import ScheduleCalendar from "./_components/schedule-calendar";

const SchedulePage = () => {
    const [reloadKey, setReloadKey] = useState(0);

    const handleReload = useCallback(() => {
        setReloadKey((prev) => prev + 1);
    }, []);

    return (
        <>
            <ListSchedule onReload={handleReload} />
            <ScheduleCalendar reloadKey={reloadKey} />
        </>
    );
};

export default SchedulePage;
