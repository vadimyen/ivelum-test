const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`

scalar Email
scalar Date
scalar Time
scalar DateTime
scalar Timezone
scalar Money

type Query {
  me: MeResponse
  trains(
    filter: TrainsFilter
    sort: [TrainsSort!]
    page: Int! = 1
    perPage: Int! = 30
  ): TrainsResponse
  trainInfo(trainId: Int!): TrainInfoResponse
  tickets(
    trainId: Int!
    filter: TicketsFilter
    sort: [TicketsSort!]
    page: Int! = 1
    perPage: Int! = 30
  ): TicketsResponse
}

type Mutation {
  bookTicket(payload: [BookTicketPayload!]!): TicketBookingResponse
  cancelTicket(payload: CancelTicketPayload!): CancelTicketResponse
}

type MeResponse {
  status: ResponseStatus!
  result: User
  error: MeResponseErrors
}

union MeResponseErrors = UnknownError

type CancelTicketResponse {
  status: ResponseStatus!
  result: CancelledTicket
  error: CancelTicketResponseError
}

type CancellationPeriodExpiredError implements Error {
  message: String!
}
union CancelTicketResponseError =
  | UnknownError
  | TimeoutError
  | CancellationPeriodExpiredError

input CancelTicketPayload {
  ticketId: [Int!]!
}

type UnknownError implements Error {
  message: String!
}

union TicketBookingResponseError =
  | TimeoutError
  | InsufficientFundsError
  | UnknownError

type TicketBookingResponse {
  status: ResponseStatus!
  result: [BookedTicket!]!
  error: TicketBookingResponseError
}

type TimeoutError implements Error {
  message: String!
}

type InsufficientFundsError implements Error {
  message: String!
}

input BookTicketPayload {
  ticketId: Int!
  passenger: UserInput!
}

input UserInput {
  passport: PassportInput!
  firstName: String!
  lastName: String!
  sex: Sex!
  dateOfBirth: Date!
  email: Email!
  phone: String!
}

enum ResponseStatus {
  Ok
  Error
}

union TrainInfoResponseError = NotFoundError | UnknownError

type TrainInfoResponse {
  status: ResponseStatus!
  result: Train
  error: TrainInfoResponseError
}

union TrainsResponseError = NotFoundError | UnknownError
type TrainsResponse {
  status: ResponseStatus!
  result: TrainsPagination
  error: TrainsResponseError
}

union TicketsResponseError = NotFoundError | UnknownError
type TicketsResponse {
  status: ResponseStatus!
  result: TicketsPagination
  error: TicketsResponseError
}

type NotFoundError implements Error {
  message: String!
}

type Bill {
  id: ID!
  sum: Money!
  Date: DateTime!
  payerEmail: Email!
}

interface BaseTicket {
  id: ID!
  status: TicketStatus!
  train: Train!
  class: TicketClass!
  price: Money!
  luggageIncluded: Boolean!
  freeCancellationUntil: DateTime!
}

type OnSaleTicket implements BaseTicket {
  id: ID!
  status: TicketStatus!
  train: Train!
  class: TicketClass!
  price: Money!
  luggageIncluded: Boolean!
  freeCancellationUntil: DateTime!
  availableAmount: Int!
}

type BookedTicket implements BaseTicket {
  id: ID!
  ticketNo: String!
  status: TicketStatus!
  train: Train!
  class: TicketClass!
  price: Money!
  luggageIncluded: Boolean!
  freeCancellationUntil: DateTime!
  
  seat: String!
  passenger: User!
  bill: Bill!
}

type CancelledTicket implements BaseTicket {
  id: ID!
  ticketNo: String!
  status: TicketStatus!
  train: Train!
  class: TicketClass!
  price: Money!
  seat: String!
  luggageIncluded: Boolean!
  freeCancellationUntil: DateTime!

  passenger: User!
  bill: Bill!

  cancellationBill: Bill
  cancellationDate: DateTime!
  
}

enum TicketStatus {
  ON_SALE
  WAITING_FOR_PAYMENT
  BOOKED
  CANCELLED
}

interface Error {
  message: String!
}

input TrainsFilter {
  fromDate: Date
  toDate: Date

  fromCountry: String
  toCountry: String
  fromLocality: String
  toLocality: String
  fromStation: String
  toStation: String

  price: MinMaxPriceInput

  travelTime: MinMaxInput
  company: String
}

enum TrainsSort {
  DATE_ASC
  DATE_DESC
  PRICE_ASC
  PRICE_DESC
  TRAVEL_TIME_ASC
  TRAVEL_TIME_DESC
}

input TicketsFilter {
  class: TicketClass
  luggageIncluded: Boolean
  freeCancellationUntil: DateTime
  price: MinMaxPriceInput
}

enum TicketClass {
  ECONOMY
  STANDARD
  BUSINESS
}

enum TicketsSort {
  PRICE_ASC
  PRICE_DESC
}

input MinMaxInput {
  min: Int
  max: Int
}

input MinMaxPriceInput {
  min: Money
  max: Money
}

type Station {
  id: ID!
  name: String!
  locality: Locality!
}

type Locality {
  id: ID!
  name: String!
  country: Country!
  timezone: Timezone!
}

type Country {
  id: ID!
  name: String!
}

type Company {
  id: ID!
  name: String!
  phone: String!
  email: Email!
  address: String!
}

enum TrainStatus {
  Arrived
  OnTheWay
  Delayed
  Cancelled
  Waiting
}

interface BaseTrain {
  id: ID!
  trainNo: String!
  departureDate: DateTime!
  arrivalDate: DateTime!
  from: Station!
  to: Station!
  travelTime: String!
  status: TrainStatus!
  company: Company!
  platform: String!
  stops: [TrainStop!]!
}

type ScheduledTrain implements BaseTrain {
  id: ID!
  trainNo: String!
  departureDate: DateTime!
  arrivalDate: DateTime!
  from: Station!
  to: Station!
  travelTime: String!
  status: TrainStatus!
  company: Company!
  platform: String!
  stops: [TrainStop!]!

  ticketPriceFrom: Money!
  ticketsOnSale: Int!
}
type CancelledTrain implements BaseTrain {
  id: ID!
  trainNo: String!
  departureDate: DateTime!
  arrivalDate: DateTime!
  from: Station!
  to: Station!
  travelTime: String!
  status: TrainStatus!
  company: Company!
  platform: String!
  stops: [TrainStop!]!

  cancellationReason: String!
}
type DelayedTrain implements BaseTrain {
  id: ID!
  trainNo: String!
  departureDate: DateTime!
  arrivalDate: DateTime!
  from: Station!
  to: Station!
  travelTime: String!
  status: TrainStatus!
  company: Company!
  platform: String!
  stops: [TrainStop!]!

  newDepartureTime: DateTime!
}

type OnTheWayTrain implements BaseTrain {
  id: ID!
  trainNo: String!
  departureDate: DateTime!
  arrivalDate: DateTime!
  from: Station!
  to: Station!
  travelTime: String!
  status: TrainStatus!
  company: Company!
  platform: String!
  stops: [TrainStop!]!

  actualDepartureTime: DateTime!
}

type ArrivedTrain implements BaseTrain {
  id: ID!
  trainNo: String!
  departureDate: DateTime!
  arrivalDate: DateTime!
  from: Station!
  to: Station!
  travelTime: String!
  status: TrainStatus!
  company: Company!
  platform: String!
  stops: [TrainStop!]!

  actualDepartureTime: DateTime!
  actualArrivalTime: DateTime!
}

type TrainStop {
  id: ID!
  place: Station!
  fromTime: DateTime!
  toTime: DateTime!
}


union Train = ScheduledTrain | DelayedTrain | CancelledTrain | ArrivedTrain | OnTheWayTrain

union UserTicket = BookedTicket | CancelledTicket
type User {
  id: ID!
  passport: Passport!
  firstName: String!
  lastName: String!
  sex: Sex!
  dateOfBirth: Date!
  email: Email!
  phone: String!
  tickets: [UserTicket!]!
}


input PassportInput {
  series: ID!
  issueDate: Date!
  issuePlace: String!
}
type Passport {
  id: ID!
  series: ID!
  issueDate: Date!
  issuePlace: String!
}

enum Sex {
  MALE
  FEMALE
}

type PaginationInfo {
  totalPages: Int!
  totalItems: Int!
  page: Int!
  perPage: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}

type TrainsPagination {
  items: [Train!]!
  pageInfo: PaginationInfo!
}

type TicketsPagination {
  items: [OnSaleTicket!]!
  pageInfo: PaginationInfo!
}

`;

const server = new ApolloServer({
  typeDefs,
  mocks: true,});

server.listen().then(({ url }) => {
  console.log(`???? Server ready at ${url}`)
});