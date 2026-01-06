import { Button } from "antd";
import type { ReactNode } from "react";

interface IProps {
    title: string;
    isVisible?: boolean;
    onClick: () => void;
    icon?: ReactNode;
    color?: string;
}

const ButtonComponents = ({
    title,
    isVisible = true,
    onClick,
    icon,
    color,
}: IProps) => {
    if (!isVisible) return null;

    return (
        <Button
            icon={icon}
            type="primary"
            onClick={onClick}
            style={{ backgroundColor: color }}
        >
            {title}
        </Button>
    );
};

export default ButtonComponents;
