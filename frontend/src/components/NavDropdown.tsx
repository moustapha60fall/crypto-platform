import { motion } from "framer-motion"
import PillCard from "./PillCard"
import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from "./ui/navigation-menu"

type NavDropdownProps = {
    title: string
    items: Array<{ title: string; to: string; color: string; icon?: any }>
}

export function NavDropdown({ title, items }: NavDropdownProps) {
    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger className="text-white bg-transparent font-semibold hover:bg-transparent hover:text-yellow-200">
                {title}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-screen left-0 text-gray-800 dark:text-gray-100 backdrop-blur-xl">

                <ul className="grid w-[400px] gap-3 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {items.map((item, i) => (
                        <motion.li
                            key={item.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                        >
                            <PillCard {...item} />
                        </motion.li>
                    ))}
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    )
}
