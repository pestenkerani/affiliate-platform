import { BaseGraphQLAPIClient, BaseGraphQLAPIClientOptions, APIResult } from '@ikas/admin-api-client';

export enum ProductTypeEnum {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  SERVICE = 'SERVICE'
}

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export type PaginationInput = {
  limit?: number;
  page?: number;
}

export type WebhookInput = {
  endpoint: string;
  salesChannelIds?: Array<string>;
  scopes: Array<string>;
}

export type GetMerchantInfoQueryVariables = {}

export type GetMerchantInfoQueryData = {
  id?: string;
  name?: string;
  email?: string;
}

export interface GetMerchantInfoQuery {
  me: GetMerchantInfoQueryData;
}

export type ListProductsQueryVariables = {
  pagination?: PaginationInput;
}

export type ListProductsQueryData = {
  count: number;
  data: Array<{
  id: string;
  name: string;
  description?: string;
  totalStock?: number;
  type: ProductTypeEnum;
  brand?: {
  name: string;
};
  categories?: Array<{
  id: string;
  name: string;
}>;
}>;
}

export interface ListProductsQuery {
  listProduct: ListProductsQueryData;
}

export type ListOrdersQueryVariables = {
  pagination?: PaginationInput;
}

export type ListOrdersQueryData = {
  count: number;
  data: Array<{
  id: string;
  orderNumber?: string;
  status: OrderStatusEnum;
  totalPrice: number;
  currencyCode: string;
  createdAt?: number;
  customer?: {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};
}>;
}

export interface ListOrdersQuery {
  listOrder: ListOrdersQueryData;
}

export type ListCustomersQueryVariables = {
  pagination?: PaginationInput;
}

export type ListCustomersQueryData = {
  count: number;
  data: Array<{
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  createdAt?: number;
  orderCount?: number;
}>;
}

export interface ListCustomersQuery {
  listCustomer: ListCustomersQueryData;
}

export type SaveWebhookMutationVariables = {
  input: WebhookInput;
}

export type SaveWebhookMutationData = Array<{
  id: string;
  endpoint: string;
  scope: string;
  createdAt?: number;
}>

export interface SaveWebhookMutation {
  saveWebhooks: SaveWebhookMutationData;
}

export type ListWebhooksQueryVariables = {}

export type ListWebhooksQueryData = Array<{
  id: string;
  endpoint: string;
  scope: string;
  createdAt?: number;
  updatedAt?: number;
}>

export interface ListWebhooksQuery {
  listWebhook: ListWebhooksQueryData;
}

export type DeleteWebhookMutationVariables = {
  scopes: string;
}

export type DeleteWebhookMutationData = boolean

export interface DeleteWebhookMutation {
  deleteWebhook: DeleteWebhookMutationData;
}

export class GeneratedQueries {
  client: BaseGraphQLAPIClient<any>;

  constructor(client: BaseGraphQLAPIClient<any>) {
    this.client = client;
  }

  async getMerchantInfo(): Promise<APIResult<Partial<GetMerchantInfoQuery>>> {
    const query = `
  query GetMerchantInfo {
    me {
      id
      name
      email
    }
  }
`;
    return this.client.query<Partial<GetMerchantInfoQuery>>({ query });
  }

  async listProducts(variables: ListProductsQueryVariables): Promise<APIResult<Partial<ListProductsQuery>>> {
    const query = `
  query ListProducts($pagination: PaginationInput) {
    listProduct(pagination: $pagination) {
      count
      data {
        id
        name
        description
        totalStock
        type
        brand {
          name
        }
        categories {
          id
          name
        }
      }
    }
  }
`;
    return this.client.query<Partial<ListProductsQuery>>({ query, variables });
  }

  async listOrders(variables: ListOrdersQueryVariables): Promise<APIResult<Partial<ListOrdersQuery>>> {
    const query = `
  query ListOrders($pagination: PaginationInput) {
    listOrder(pagination: $pagination) {
      count
      data {
        id
        orderNumber
        status
        totalPrice
        currencyCode
        createdAt
        customer {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;
    return this.client.query<Partial<ListOrdersQuery>>({ query, variables });
  }

  async listCustomers(variables: ListCustomersQueryVariables): Promise<APIResult<Partial<ListCustomersQuery>>> {
    const query = `
  query ListCustomers($pagination: PaginationInput) {
    listCustomer(pagination: $pagination) {
      count
      data {
        id
        firstName
        lastName
        email
        phone
        createdAt
        orderCount
      }
    }
  }
`;
    return this.client.query<Partial<ListCustomersQuery>>({ query, variables });
  }

  async listWebhooks(): Promise<APIResult<Partial<ListWebhooksQuery>>> {
    const query = `
  query ListWebhooks {
    listWebhook {
      id
      endpoint
      scope
      createdAt
      updatedAt
    }
  }
`;
    return this.client.query<Partial<ListWebhooksQuery>>({ query });
  }
}

export class GeneratedMutations {
  client: BaseGraphQLAPIClient<any>;

  constructor(client: BaseGraphQLAPIClient<any>) {
    this.client = client;
  }

  async saveWebhook(variables: SaveWebhookMutationVariables): Promise<APIResult<Partial<SaveWebhookMutation>>> {
    const mutation = `
  mutation SaveWebhook($input: WebhookInput!) {
    saveWebhooks(input: $input) {
      id
      endpoint
      scope
      createdAt
    }
  }
`;
    return this.client.mutate<Partial<SaveWebhookMutation>>({ mutation, variables });
  }

  async deleteWebhook(variables: DeleteWebhookMutationVariables): Promise<APIResult<Partial<DeleteWebhookMutation>>> {
    const mutation = `
  mutation DeleteWebhook($scopes: [String!]!) {
    deleteWebhook(scopes: $scopes)
  }
`;
    return this.client.mutate<Partial<DeleteWebhookMutation>>({ mutation, variables });
  }
}

export class ikasAdminGraphQLAPIClient<TokenData> extends BaseGraphQLAPIClient<TokenData> {
  queries: GeneratedQueries;
  mutations: GeneratedMutations;

  constructor(options: BaseGraphQLAPIClientOptions<TokenData>) {
    super(options);
    this.queries = new GeneratedQueries(this);
    this.mutations = new GeneratedMutations(this);
  }
}
