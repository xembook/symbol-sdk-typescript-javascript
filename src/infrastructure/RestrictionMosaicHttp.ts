/*
 * Copyright 2019 NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Observable } from 'rxjs';
import {
    MosaicAddressRestrictionDTO,
    MosaicGlobalRestrictionDTO,
    RestrictionMosaicRoutesApi,
} from 'symbol-openapi-typescript-fetch-client';
import { Address } from '../model/account/Address';
import { MosaicId } from '../model/mosaic/MosaicId';
import { MosaicAddressRestriction } from '../model/restriction/MosaicAddressRestriction';
import { MosaicGlobalRestriction } from '../model/restriction/MosaicGlobalRestriction';
import { MosaicGlobalRestrictionItem } from '../model/restriction/MosaicGlobalRestrictionItem';
import { Http } from './Http';
import { RestrictionMosaicRepository } from './RestrictionMosaicRepository';

/**
 * RestrictionMosaic http repository.
 *
 * @since 1.0
 */
export class RestrictionMosaicHttp extends Http implements RestrictionMosaicRepository {
    /**
     * @internal
     */
    private restrictionMosaicRoutesApi: RestrictionMosaicRoutesApi;

    /**
     * Constructor
     * @param url Base catapult-rest url
     * @param fetchApi fetch function to be used when performing rest requests.
     */
    constructor(url: string, fetchApi?: any) {
        super(url, fetchApi);
        this.restrictionMosaicRoutesApi = new RestrictionMosaicRoutesApi(this.config());
    }

    /**
     * Get mosaic address restriction.
     * @summary Get mosaic address restrictions for a given mosaic and account identifier.
     * @param mosaicId Mosaic identifier.
     * @param address address
     * @returns Observable<MosaicAddressRestriction>
     */
    getMosaicAddressRestriction(mosaicId: MosaicId, address: Address): Observable<MosaicAddressRestriction> {
        return this.call(this.restrictionMosaicRoutesApi.getMosaicAddressRestriction(mosaicId.toHex(), address.plain()), (body) =>
            this.toMosaicAddressRestriction(body),
        );
    }

    /**
     * Get mosaic address restrictions.
     * @summary Get mosaic address restrictions for a given mosaic and account identifiers array
     * @param mosaicId Mosaic identifier.
     * @param addresses list of addresses
     * @returns Observable<MosaicAddressRestriction[]>
     */
    getMosaicAddressRestrictions(mosaicId: MosaicId, addresses: Address[]): Observable<MosaicAddressRestriction[]> {
        const accountIds = {
            addresses: addresses.map((address) => address.plain()),
        };
        return this.call(this.restrictionMosaicRoutesApi.getMosaicAddressRestrictions(mosaicId.toHex(), accountIds), (body) =>
            body.map(this.toMosaicAddressRestriction),
        );
    }

    /**
     * Get mosaic global restriction.
     * @summary Get mosaic global restrictions for a given mosaic identifier.
     * @param mosaicId Mosaic identifier.
     * @returns Observable<MosaicGlobalRestriction>
     */
    getMosaicGlobalRestriction(mosaicId: MosaicId): Observable<MosaicGlobalRestriction> {
        return this.call(this.restrictionMosaicRoutesApi.getMosaicGlobalRestriction(mosaicId.toHex()), (body) =>
            this.toMosaicGlobalRestriction(body),
        );
    }

    /**
     * Get mosaic global restrictions.
     * @summary Get mosaic global restrictions for a given list of mosaics.
     * @param mosaicIds List of mosaic identifier.
     * @returns Observable<MosaicGlobalRestriction[]>
     */
    getMosaicGlobalRestrictions(mosaicIds: MosaicId[]): Observable<MosaicGlobalRestriction[]> {
        const mosaicIdsBody = {
            mosaicIds: mosaicIds.map((id) => id.toHex()),
        };
        return this.call(this.restrictionMosaicRoutesApi.getMosaicGlobalRestrictions(mosaicIdsBody), (body) =>
            body.map(this.toMosaicGlobalRestriction),
        );
    }

    /**
     * This method maps a MosaicAddressRestrictionDTO from rest to the SDK's MosaicAddressRestriction model object.
     *
     * @internal
     * @param {MosaicAddressRestrictionDTO} dto the MosaicAddressRestrictionDTO object from rest.
     * @returns {MosaicAddressRestriction} a MosaicAddressRestriction model
     */
    private toMosaicAddressRestriction(dto: MosaicAddressRestrictionDTO): MosaicAddressRestriction {
        const restrictionItems = new Map<string, string>();
        dto.mosaicRestrictionEntry.restrictions.forEach((restriction) => {
            restrictionItems.set(restriction.key, restriction.value);
        });
        return new MosaicAddressRestriction(
            dto.mosaicRestrictionEntry.compositeHash,
            dto.mosaicRestrictionEntry.entryType.valueOf(),
            new MosaicId(dto.mosaicRestrictionEntry.mosaicId),
            Address.createFromEncoded(dto.mosaicRestrictionEntry.targetAddress),
            restrictionItems,
        );
    }

    /**
     * This method maps a MosaicGlobalRestrictionDTO from rest to the SDK's MosaicGlobalRestriction model object.
     *
     * @internal
     * @param {MosaicGlobalRestrictionDTO} dto the MosaicGlobalRestrictionDTO object from rest.
     * @returns {MosaicGlobalRestriction} a MosaicGlobalRestriction model
     */
    private toMosaicGlobalRestriction(dto: MosaicGlobalRestrictionDTO): MosaicGlobalRestriction {
        const restirctionItems = new Map<string, MosaicGlobalRestrictionItem>();
        dto.mosaicRestrictionEntry.restrictions.forEach((restriction) =>
            restirctionItems.set(
                restriction.key,
                new MosaicGlobalRestrictionItem(
                    new MosaicId(restriction.restriction.referenceMosaicId),
                    restriction.restriction.restrictionValue,
                    restriction.restriction.restrictionType.valueOf(),
                ),
            ),
        );
        return new MosaicGlobalRestriction(
            dto.mosaicRestrictionEntry.compositeHash,
            dto.mosaicRestrictionEntry.entryType.valueOf(),
            new MosaicId(dto.mosaicRestrictionEntry.mosaicId),
            restirctionItems,
        );
    }
}
