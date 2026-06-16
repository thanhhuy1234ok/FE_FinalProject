import ModalSchedule from "./modal";

interface IListScheduleProps {
    openModal: boolean;
    setOpenModal: (value: boolean) => void;
    onReload?: () => void;
}

const ListSchedule = ({
    openModal,
    setOpenModal,
    onReload,
}: IListScheduleProps) => {
    return (
        <ModalSchedule
            openModal={openModal}
            setOpenModal={setOpenModal}
            fetchData={() => {
                onReload?.();
            }}
        />
    );
};

export default ListSchedule;
