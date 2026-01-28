import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import ButtonComponents from "./button";

interface IProps {
    handleExportData: () => void;
    setOpenModalImport?: (v: boolean) => void;
    setOpenModal: (v: boolean) => void;

    showExport?: boolean;
    showImport?: boolean;
    showAdd?: boolean;
}

const RenderHeaderTable = ({
    handleExportData,
    // setOpenModalImport,
    setOpenModal,
    showExport = true,
    // showImport = true,
    showAdd = true,
}: IProps) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', gap: 15 }}>
                {showExport && (
                    <ButtonComponents
                        icon={<ExportOutlined />}
                        onClick={handleExportData}
                        title="Export"
                        isVisible
                    />
                )}

                {/* {showImport && (
                    <ButtonComponents
                        icon={<CloudUploadOutlined />}
                        onClick={() => setOpenModalImport(true)}
                        title="Import"
                        isVisible
                    />
                )} */}

                {showAdd && (
                    <ButtonComponents
                        icon={<PlusOutlined />}
                        onClick={() => setOpenModal(true)}
                        title="Thêm mới"
                        isVisible
                    />
                )}
            </span>
        </div>
    );
};

export default RenderHeaderTable;
