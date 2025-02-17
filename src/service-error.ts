export class ServiceError {
  public static readonly COULD_NOT_UPDATE = new Error('Could not update');
  public static readonly ENTERPRISE_NOT_FOUND = new Error(
    'Enterprise not found'
  );
}
