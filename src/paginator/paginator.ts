import { sign, verify } from "jsonwebtoken";
import { Logger } from "@nestjs/common";

/**
 * The `Paginator` class provides functionalities for parsing, managing,
 * and generating pagination tokens. It is designed to securely handle
 * tokens through encoding and decoding operations and allows for the
 * storage and retrieval of key-value pairs in the token data.
 */
export class Paginator {
  private static readonly secretKey = 'pagination-secret-key';
  private readonly logger = new Logger(Paginator.name);
  private readonly tokenData: object = {};

  /**
   * Private constructor for initializing the object with token data.
   *
   * @param {object} tokenData - The token data used to initialize the instance.
   */
  private constructor(tokenData: object) {
    this.tokenData = tokenData;
  }

  /**
   * Initializes and returns a new instance of the Paginator class.
   *
   * @return {Paginator} A new instance of Paginator.
   */
  public static init(): Paginator {
    return new Paginator({});
  }

  /**
   * Parses a pagination token to retrieve pagination details.
   *
   * @param {string} token The encoded token string containing pagination data.
   * @return {Paginator} Returns an instance of the Paginator class containing decoded pagination information.
   */
  public static parsePaginationToken(token: string | null): Paginator {
    if (!token) {
      return new Paginator({});
    }

    try {
      const decoded = verify(token, Paginator.secretKey);

      return new Paginator(
        typeof decoded === 'object' && decoded !== null ? decoded : {}
      );
    } catch (error) {
      console.error('Invalid token:', error);
      return new Paginator({});
    }
  }

  /**
   * Sets a value associated with a specified key in the token data storage.
   *
   * @param {string} key - The key with which the value will be associated.
   * @param {T} value - The value to store associated with the specified key.
   * @return {void}
   */
  set<T>(key: string, value: T) {
    this.tokenData[key] = value;
  }

  /**
   * Retrieves the value associated with the given key from the token data.
   *
   * @param {string} key - The key for which the value needs to be retrieved.
   * @return {T|null} The value associated with the key, or null if the key does not exist.
   */
  get<T>(key: string): T | null {
    return this.tokenData[key] || null;
  }

  /**
   * Generates and returns a pagination token.
   *
   * The method utilizes the provided token data and a secret key
   * to create a signed pagination token for secure data pagination.
   *
   * @return {string} The generated pagination token.
   */
  getPaginationToken(): string {
    this.logger.debug(
      `Generating pagination token for ${JSON.stringify(this.tokenData)}`
    );
    const token = sign(this.tokenData, Paginator.secretKey);
    this.logger.debug(`Generated token: ${token}`);
    return token;
  }
}
