import Icon from 'ant-design-vue/es/icon'

export const NestedIcon = {
  name: 'NestedIcon',
  props: ['icon'],
  render(h) {
    const { icon } = this
    if (!icon) return null
    if (typeof icon === 'string') return <a-icon type={icon}></a-icon>
    const props = {}
    typeof icon === 'object' ? (props.component = icon) : (props.type = icon)
    return <Icon {...{ props }} />
  }
}
