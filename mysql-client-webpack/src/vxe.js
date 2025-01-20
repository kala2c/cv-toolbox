// ...
import {
    VxeUI,

    VxeButton,
    VxeButtonGroup,
    VxeDrawer,
    VxeForm,
    VxeFormGroup,
    VxeFormItem,
    VxeIcon,
    VxeLoading,
    VxeModal,
    VxePager,
    VxePrint,
    VxeTooltip,
    VxeUpload
} from 'vxe-pc-ui'

import {
    VxeTable,
    VxeColumn,
    VxeColgroup,
    VxeGrid,
    VxeToolbar
} from 'vxe-table'

// 导入主题变量，也可以重写主题变量
import 'vxe-table/styles/cssvar.scss'
import 'vxe-pc-ui/styles/cssvar.scss'

// 导入默认的语言
import zhCN from 'vxe-table/locale/lang/zh-CN'

VxeUI.setI18n('zh-CN', zhCN)
VxeUI.setLanguage('zh-CN')

// 注册组件
// 如果页面中已经被显性导入了，则可以不用调用注册
// 如果是配置式的，没有在页面中显性导入，则需要逐个注册
VxeUI.component(VxeButton)
VxeUI.component(VxeButtonGroup)
VxeUI.component(VxeDrawer)
VxeUI.component(VxeForm)
VxeUI.component(VxeFormGroup)
VxeUI.component(VxeFormItem)
VxeUI.component(VxeIcon)
VxeUI.component(VxeLoading)
VxeUI.component(VxeModal)
VxeUI.component(VxePager)
VxeUI.component(VxePrint)
VxeUI.component(VxeTooltip)
VxeUI.component(VxeUpload)

VxeUI.component(VxeTable)
VxeUI.component(VxeColumn)
VxeUI.component(VxeColgroup)
VxeUI.component(VxeGrid)
VxeUI.component(VxeToolbar)