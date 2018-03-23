package jobs

import (
	"fmt"
	"github.com/getsentry/raven-go"
	"github.com/oysterprotocol/brokernode/models"
	"github.com/oysterprotocol/brokernode/services"
)

func init() {
}

func VerifyDataMaps(IotaWrapper services.IotaService) {

	unverifiedDataMaps := []models.DataMap{}

	err := models.DB.Where("status = ?", models.Unverified).All(&unverifiedDataMaps)
	if err != nil {
		raven.CaptureError(err, nil)
	}

	if len(unverifiedDataMaps) > 0 {
		for i := 0; i < len(unverifiedDataMaps); i += BundleSize {
			end := i + BundleSize

			if end > len(unverifiedDataMaps) {
				end = len(unverifiedDataMaps)
			}

			CheckChunks(IotaWrapper, unverifiedDataMaps[i:end])
		}
	}
}

func CheckChunks(IotaWrapper services.IotaService, unverifiedDataMaps []models.DataMap) {

	filteredChunks, err := IotaWrapper.VerifyChunkMessagesMatchRecord(unverifiedDataMaps)

	if err != nil {
		fmt.Println(err)
	}

	if len(filteredChunks.MatchesTangle) > 0 {

		for _, matchingChunk := range filteredChunks.MatchesTangle {
			//go services.SegmentClient.Enqueue(analytics.Track{
			//	Event:  "chunk_matched_tangle",
			//	UserId: services.GetLocalIP(),
			//	Properties: analytics.NewProperties().
			//		Set("address", matchingChunk.Address).
			//		Set("genesis_hash", matchingChunk.GenesisHash).
			//		Set("chunk_idx", matchingChunk.ChunkIdx),
			//})

			models.DB.RawQuery("UPDATE data_maps SET status = ? WHERE genesis_hash = ?",
				models.Complete, matchingChunk.GenesisHash)
		}
	}

	if len(filteredChunks.DoesNotMatchTangle) > 0 {

		// when we bring back hooknodes, decrement their reputation here

		for _, notMatchingChunk := range filteredChunks.DoesNotMatchTangle {
			//go services.SegmentClient.Enqueue(analytics.Track{
			//	Event:  "resend_chunk_tangle_mismatch",
			//	UserId: services.GetLocalIP(),
			//	Properties: analytics.NewProperties().
			//		Set("address", notMatchingChunk.Address).
			//		Set("genesis_hash", notMatchingChunk.GenesisHash).
			//		Set("chunk_idx", notMatchingChunk.ChunkIdx),
			//})

			models.DB.RawQuery("UPDATE data_maps SET status = ?, trunk_tx = ?, branch_tx = ?, node_id = ?, WHERE genesis_hash = ?",
				models.Unassigned, "", "", "", notMatchingChunk.GenesisHash)
		}

		IotaWrapper.ProcessChunks(filteredChunks.DoesNotMatchTangle, true)
	}
}
