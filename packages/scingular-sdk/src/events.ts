export type EventEnvelope<TType extends string, TPayload> = {
  type: TType;
  ts: string;
  correlationId?: string;
  payload: TPayload;
};

export type PublishFn = <TType extends string, TPayload>(
  evt: EventEnvelope<TType, TPayload>
) => void;

export type SubscribeFn = <TType extends string>(
  type: TType,
  handler: (evt: EventEnvelope<TType, any>) => void
) => () => void;
