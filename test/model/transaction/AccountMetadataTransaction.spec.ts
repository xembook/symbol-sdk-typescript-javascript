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

import { expect } from 'chai';
import { Convert } from '../../../src/core/format/Convert';
import { Account } from '../../../src/model/account/Account';
import { NetworkType } from '../../../src/model/network/NetworkType';
import { AccountMetadataTransaction } from '../../../src/model/transaction/AccountMetadataTransaction';
import { Deadline } from '../../../src/model/transaction/Deadline';
import { UInt64 } from '../../../src/model/UInt64';
import { TestingAccount } from '../../conf/conf.spec';
import { EmbeddedTransactionBuilder } from 'catbuffer-typescript/dist/EmbeddedTransactionBuilder';
import { TransactionType } from '../../../src/model/transaction/TransactionType';
import { deepEqual } from 'assert';
import { Address } from '../../../src/model/account/Address';
import { NamespaceId } from '../../../src/model/namespace/NamespaceId';

describe('AccountMetadataTransaction', () => {
    let account: Account;
    const generationHash = '57F7DA205008026C776CB6AED843393F04CD458E0AA2D9F1D5F31A402072B2D6';
    before(() => {
        account = TestingAccount;
    });

    it('should default maxFee field be set to 0', () => {
        const accountMetadataTransaction = AccountMetadataTransaction.create(
            Deadline.create(),
            account.address,
            UInt64.fromUint(1000),
            1,
            Convert.uint8ToUtf8(new Uint8Array(10)),
            NetworkType.MIJIN_TEST,
        );

        expect(accountMetadataTransaction.maxFee.higher).to.be.equal(0);
        expect(accountMetadataTransaction.maxFee.lower).to.be.equal(0);
    });

    it('should filled maxFee override transaction maxFee', () => {
        const accountMetadataTransaction = AccountMetadataTransaction.create(
            Deadline.create(),
            account.address,
            UInt64.fromUint(1000),
            1,
            Convert.uint8ToUtf8(new Uint8Array(10)),
            NetworkType.MIJIN_TEST,
            new UInt64([1, 0]),
        );

        expect(accountMetadataTransaction.maxFee.higher).to.be.equal(0);
        expect(accountMetadataTransaction.maxFee.lower).to.be.equal(1);
    });

    it('should create and sign an AccountMetadataTransaction object', () => {
        const accountMetadataTransaction = AccountMetadataTransaction.create(
            Deadline.create(),
            account.address,
            UInt64.fromUint(1000),
            1,
            Convert.uint8ToUtf8(new Uint8Array(10)),
            NetworkType.MIJIN_TEST,
        );

        const signedTransaction = accountMetadataTransaction.signWith(account, generationHash);

        expect(signedTransaction.payload.substring(256, signedTransaction.payload.length)).to.be.equal(
            '90D66C33420E5411995BACFCA2B28CF1C9F5DD7AB1204EA4E80300000000000001000A0000000000000000000000',
        );
    });

    describe('size', () => {
        it('should return 174 for AccountMetadataTransaction byte size', () => {
            const accountMetadataTransaction = AccountMetadataTransaction.create(
                Deadline.create(),
                account.address,
                UInt64.fromUint(1000),
                1,
                Convert.uint8ToUtf8(new Uint8Array(10)),
                NetworkType.MIJIN_TEST,
            );

            expect(Convert.hexToUint8(accountMetadataTransaction.serialize()).length).to.be.equal(accountMetadataTransaction.size);
            expect(accountMetadataTransaction.size).to.be.equal(174);

            const signedTransaction = accountMetadataTransaction.signWith(account, generationHash);
            expect(signedTransaction.hash).not.to.be.undefined;
        });

        it('should set payload size', () => {
            const accountMetadataTransaction = AccountMetadataTransaction.create(
                Deadline.create(),
                account.address,
                UInt64.fromUint(1000),
                1,
                Convert.uint8ToUtf8(new Uint8Array(10)),
                NetworkType.MIJIN_TEST,
            );

            expect(Convert.hexToUint8(accountMetadataTransaction.serialize()).length).to.be.equal(accountMetadataTransaction.size);
            expect(accountMetadataTransaction.size).to.be.equal(174);

            expect(accountMetadataTransaction.setPayloadSize(10).size).to.be.equal(10);
        });
    });

    it('should create EmbeddedTransactionBuilder', () => {
        const accountMetadataTransaction = AccountMetadataTransaction.create(
            Deadline.create(),
            account.address,
            UInt64.fromUint(1000),
            1,
            Convert.uint8ToUtf8(new Uint8Array(10)),
            NetworkType.MIJIN_TEST,
        );

        Object.assign(accountMetadataTransaction, { signer: account.publicAccount });

        const embedded = accountMetadataTransaction.toEmbeddedTransaction();

        expect(embedded).to.be.instanceOf(EmbeddedTransactionBuilder);
        expect(Convert.uint8ToHex(embedded.signerPublicKey.key)).to.be.equal(account.publicKey);
        expect(embedded.type.valueOf()).to.be.equal(TransactionType.ACCOUNT_METADATA.valueOf());
    });

    it('should resolve alias', () => {
        const accountMetadataTransaction = AccountMetadataTransaction.create(
            Deadline.create(),
            account.address,
            UInt64.fromUint(1000),
            1,
            Convert.uint8ToUtf8(new Uint8Array(10)),
            NetworkType.MIJIN_TEST,
        );

        const resolved = accountMetadataTransaction.resolveAliases();

        expect(resolved).to.be.instanceOf(AccountMetadataTransaction);
        deepEqual(accountMetadataTransaction, resolved);
    });

    it('Notify Account', () => {
        const tx = AccountMetadataTransaction.create(
            Deadline.create(),
            account.address,
            UInt64.fromUint(1000),
            1,
            Convert.uint8ToUtf8(new Uint8Array(10)),
            NetworkType.MIJIN_TEST,
        );

        let canNotify = tx.shouldNotifyAccount(account.address, []);
        expect(canNotify).to.be.true;

        canNotify = tx.shouldNotifyAccount(Address.createFromRawAddress('SATNE7Q5BITMUTRRN6IB4I7FLSDRDWZA34I2PMQ'), []);
        expect(canNotify).to.be.false;

        Object.assign(tx, { signer: account.publicAccount });
        expect(tx.shouldNotifyAccount(account.address, [])).to.be.true;
    });

    it('Notify Account with alias', () => {
        const alias = new NamespaceId('test');
        const wrongAlias = new NamespaceId('wrong');
        const tx = AccountMetadataTransaction.create(
            Deadline.create(),
            account.address,
            UInt64.fromUint(1000),
            1,
            Convert.uint8ToUtf8(new Uint8Array(10)),
            NetworkType.MIJIN_TEST,
        );

        let canNotify = tx.shouldNotifyAccount(account.address, [alias]);
        expect(canNotify).to.be.true;

        canNotify = tx.shouldNotifyAccount(Address.createFromRawAddress('SATNE7Q5BITMUTRRN6IB4I7FLSDRDWZA34I2PMQ'), [wrongAlias]);
        expect(canNotify).to.be.false;

        Object.assign(tx, { signer: account.publicAccount });
        expect(tx.shouldNotifyAccount(account.address, [])).to.be.true;
    });
});
