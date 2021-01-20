export const roleTableColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    align: 'center',
    scopedSlots: { customRender: 'index' }
  },
  {
    title: '角色名称',
    dataIndex: 'roleName',
    align: 'center',
    key: 'roleName'
  },
  {
    title: '成员列表',
    dataIndex: 'members',
    key: 'members',
    align: 'center',
    scopedSlots: { customRender: 'members' }
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    align: 'center',
    key: 'createdAt'
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    align: 'center',
    scopedSlots: { customRender: 'action' }
  }
]

export const memberTableColumns = [
  {
    title: '序号',
    key: 'index',
    align: 'center',
    scopedSlots: { customRender: 'index' }
  },
  {
    title: '真实姓名',
    align: 'center',
    dataIndex: 'realName'
  },
  {
    title: '手机号',
    align: 'center',
    dataIndex: 'phone'
  },
  {
    title: '用户名',
    align: 'center',
    dataIndex: 'userName'
  },
  {
    title: '状态',
    dataIndex: 'status',
    align: 'center',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createdAt'
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    scopedSlots: { customRender: 'action' }
  }
]

/**
 * 1.将菜单的格式转化为Tree组件需要的格式 2.统计每一个一级菜单下的id集合
 * @param {*} menu 一级菜单
 * @param {*} ids 一级菜单下的id集合
 */
export const menu2treeData = (menu, ids) => {
  menu.title = menu.meta.title
  if (menu.children && menu.children.length > 0) {
    menu.children.forEach(m => {
      menu2treeData(m, ids)
    })
  } else {
    ids.push(menu.id)
  }
}

export const fmtCheckbox = list => {
  list.forEach(item => {
    item.label = item.roleName
    item.value = item.id
  })
  return list
}
