export type ProfileProps = {
  userId: string
  username: string
  email: string
  phoneNumber: string
  createdAt: string
  subscriptions: string[]
}

export class Profile {
  readonly userId: string
  readonly username: string
  readonly email: string
  readonly phoneNumber: string
  readonly createdAt: string
  readonly subscriptions: string[]

  constructor(props: ProfileProps) {
    this.userId = props.userId
    this.username = props.username
    this.email = props.email
    this.phoneNumber = props.phoneNumber
    this.createdAt = props.createdAt
    this.subscriptions = props.subscriptions ?? []
  }

  get displayName() {
    return this.username || this.email
  }

  get isSubscribed() {
    return this.subscriptions.length > 0
  }
}
