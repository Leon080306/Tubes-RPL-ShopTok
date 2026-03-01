export type BasicMenuProps = {
    label: string;
    menuItems: string[];
    className?: string;
    onSelect?: (value: string) => void;
}