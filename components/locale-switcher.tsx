'use client'
import {useLocale, useTranslations} from "next-intl";
import {useTransition} from "react";
import {usePathname, useRouter} from "next/navigation";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/dropdown";
import {Button} from "@nextui-org/button";
import {locales} from "@/config";

export const LocalSwitcher = () => {
    const t = useTranslations('LocaleSwitcher')
    const curLocale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()


    const onSelectChange = (val: string) => {

        startTransition(()=>{
            // @ts-ignore
            router.replace(`/${val}`, {locale: val})
        })

    }

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    size={'sm'}
                    variant={'light'}

                >
                    {t('locale', {locale: curLocale})}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label={t('label')} onAction={(key)=>{onSelectChange(key.toString())}}>
                {locales.map((locale) => (
                    <DropdownItem key={locale} value={locale} onPress={() => {
                        onSelectChange(locale)
                    }}>
                        {t('locale', {locale: locale})}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
        // <div>
        //     <Select
        //         label={t('label')}
        //         size={'sm'}
        //         className="max-w"
        //     >
        //         {locales.map((locale) => (
        //             <SelectItem key={locale} value={locale}>
        //                 {t('locale', {locale: locale})}
        //             </SelectItem>
        //         ))}
        //     </Select>
        // </div>

    )
}
