/*
 * Copyright 2020 NEM
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

import { instance, mock } from 'ts-mockito';
import { BlockRepository } from '../../../src/infrastructure/BlockRepository';
import { BlockPaginationStreamer } from '../../../src/infrastructure/paginationStreamer/BlockPaginationStreamer';
import { PaginationStreamerTestHelper } from './PaginationStreamerTestHelper';

describe('BlockPaginationStreamer', () => {
    it('basicMultiPageTest', () => {
        const blockRepositoryMock: BlockRepository = mock();
        const streamer = new BlockPaginationStreamer(instance(blockRepositoryMock));
        const tester = new PaginationStreamerTestHelper(streamer, mock(), blockRepositoryMock, {});
        return tester.basicMultiPageTest();
    });

    it('basicSinglePageTest', () => {
        const blockRepositoryMock: BlockRepository = mock();
        const streamer = new BlockPaginationStreamer(instance(blockRepositoryMock));
        const tester = new PaginationStreamerTestHelper(streamer, mock(), blockRepositoryMock, {});
        return tester.basicSinglePageTest();
    });

    it('limitToTwoPages', () => {
        const blockRepositoryMock: BlockRepository = mock();
        const streamer = new BlockPaginationStreamer(instance(blockRepositoryMock));
        const tester = new PaginationStreamerTestHelper(streamer, mock(), blockRepositoryMock, {});
        return tester.limitToTwoPages();
    });

    it('multipageWithLimit', () => {
        const blockRepositoryMock: BlockRepository = mock();
        const streamer = new BlockPaginationStreamer(instance(blockRepositoryMock));
        const tester = new PaginationStreamerTestHelper(streamer, mock(), blockRepositoryMock, {});
        return tester.multipageWithLimit();
    });

    it('limitToThreePages', () => {
        const blockRepositoryMock: BlockRepository = mock();
        const streamer = new BlockPaginationStreamer(instance(blockRepositoryMock));
        const tester = new PaginationStreamerTestHelper(streamer, mock(), blockRepositoryMock, {});
        return tester.limitToThreePages();
    });
});
